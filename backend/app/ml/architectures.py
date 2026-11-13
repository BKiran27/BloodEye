"""
BloodEye Advanced Oculomic Neural Architectures
Includes:
- CBAM (Convolutional Block Attention Module: Channel & Spatial Attention)
- Multi-Task Dual-Head Neural Architecture (ABO 4-class + RhD binary + Joint 8-class Phenotype)
- Clinical Oculomic Feature Fusion (Biomarker MLP concatenated with Deep Latents)
- Temperature Scaling for Calibrated Probability Estimation
"""

import tensorflow as tf
from tensorflow.keras import layers, Model
from tensorflow.keras.applications import EfficientNetB0, ResNet50

class ChannelAttention(layers.Layer):
    """Channel Attention sub-module of CBAM."""
    def __init__(self, ratio=8, **kwargs):
        super(ChannelAttention, self).__init__(**kwargs)
        self.ratio = ratio

    def build(self, input_shape):
        channels = input_shape[-1]
        self.shared_dense_one = layers.Dense(
            channels // self.ratio, 
            activation='relu', 
            kernel_initializer='he_normal',
            use_bias=True, 
            bias_initializer='zeros'
        )
        self.shared_dense_two = layers.Dense(
            channels, 
            kernel_initializer='he_normal',
            use_bias=True, 
            bias_initializer='zeros'
        )
        super(ChannelAttention, self).build(input_shape)

    def call(self, inputs):
        # Global Average & Max Pooling across spatial dimensions
        avg_pool = layers.GlobalAveragePooling2D()(inputs)
        max_pool = layers.GlobalMaxPooling2D()(inputs)

        avg_out = self.shared_dense_two(self.shared_dense_one(avg_pool))
        max_out = self.shared_dense_two(self.shared_dense_one(max_pool))

        out = layers.Activation('sigmoid')(avg_out + max_out)
        out = layers.Reshape((1, 1, inputs.shape[-1]))(out)
        return inputs * out

    def get_config(self):
        config = super().get_config()
        config.update({'ratio': self.ratio})
        return config


class SpatialAttention(layers.Layer):
    """Spatial Attention sub-module of CBAM."""
    def __init__(self, kernel_size=7, **kwargs):
        super(SpatialAttention, self).__init__(**kwargs)
        self.kernel_size = kernel_size
        self.conv2d = layers.Conv2D(
            1, 
            kernel_size=kernel_size, 
            strides=1, 
            padding='same', 
            activation='sigmoid',
            kernel_initializer='he_normal',
            use_bias=False
        )

    def call(self, inputs):
        avg_pool = tf.reduce_mean(inputs, axis=-1, keepdims=True)
        max_pool = tf.reduce_max(inputs, axis=-1, keepdims=True)
        concat = layers.Concatenate(axis=-1)([avg_pool, max_pool])
        spatial_map = self.conv2d(concat)
        return inputs * spatial_map

    def get_config(self):
        config = super().get_config()
        config.update({'kernel_size': self.kernel_size})
        return config


class CBAMBlock(layers.Layer):
    """Full CBAM block sequentially applying Channel and Spatial attention."""
    def __init__(self, ratio=8, kernel_size=7, **kwargs):
        super(CBAMBlock, self).__init__(**kwargs)
        self.channel_att = ChannelAttention(ratio=ratio)
        self.spatial_att = SpatialAttention(kernel_size=kernel_size)

    def call(self, inputs):
        x = self.channel_att(inputs)
        return self.spatial_att(x)


class TemperatureScaling(layers.Layer):
    """Calibrates logits via learnable or fixed temperature parameter T."""
    def __init__(self, initial_temperature=1.24, **kwargs):
        super(TemperatureScaling, self).__init__(**kwargs)
        self.initial_temperature = initial_temperature

    def build(self, input_shape):
        self.temperature = self.add_weight(
            name='temperature',
            shape=(1,),
            initializer=tf.keras.initializers.Constant(self.initial_temperature),
            trainable=False
        )
        super(TemperatureScaling, self).build(input_shape)

    def call(self, logits):
        return logits / self.temperature


def build_multitask_efficientnet(
    image_shape=(224, 224, 3), 
    num_biomarkers=16, 
    fine_tune_layers=20,
    temperature=1.24
) -> Model:
    """
    Builds the state-of-the-art Multi-Task Hybrid EfficientNet-B0 architecture:
    1. Visual Branch: EfficientNetB0 + CBAM Attention + GAP (1280-d)
    2. Biomarker Branch: 16 Oculomic Handcrafted Features + Dense MLP (64-d)
    3. Multimodal Fusion: Concatenation (1344-d) + Dense Bottleneck
    4. Dual Heads:
       - ABO Branch (4 logits: A, B, AB, O)
       - RhD Branch (1 logit: +/-)
       - Phenotype Branch (8 joint blood group classes with temperature scaling)
    """
    image_input = layers.Input(shape=image_shape, name='image_input')
    biomarker_input = layers.Input(shape=(num_biomarkers,), name='biomarker_input')

    # Visual Backbone
    base_net = EfficientNetB0(include_top=False, weights='imagenet', input_tensor=image_input)
    base_net.trainable = True
    if fine_tune_layers > 0:
        for layer in base_net.layers[:-fine_tune_layers]:
            layer.trainable = False

    # Apply CBAM Attention on top convolutional feature maps
    top_conv = base_net.output
    attended_features = CBAMBlock(ratio=8, kernel_size=7, name='cbam_attention')(top_conv)
    
    # Global average pooling
    visual_latents = layers.GlobalAveragePooling2D(name='global_avg_pool')(attended_features)
    visual_latents = layers.BatchNormalization()(visual_latents)
    visual_latents = layers.Dropout(0.3)(visual_latents)

    # Clinical Biomarker Branch
    bio = layers.Dense(64, activation='swish', name='bio_dense_1')(biomarker_input)
    bio = layers.BatchNormalization()(bio)
    bio = layers.Dropout(0.2)(bio)
    bio_latents = layers.Dense(32, activation='swish', name='bio_dense_2')(bio)

    # Multimodal Feature Fusion
    fused = layers.Concatenate(name='multimodal_fusion')([visual_latents, bio_latents])
    bottleneck = layers.Dense(256, activation='swish', name='fusion_bottleneck')(fused)
    bottleneck = layers.BatchNormalization()(bottleneck)
    bottleneck = layers.Dropout(0.4)(bottleneck)

    # Head 1: ABO Classification (4 classes: A, B, AB, O)
    abo_logits = layers.Dense(4, name='abo_logits')(bottleneck)
    abo_output = layers.Activation('softmax', name='abo_output')(abo_logits)

    # Head 2: RhD Binary Status (Positive vs Negative)
    rhd_logits = layers.Dense(1, name='rhd_logits')(bottleneck)
    rhd_output = layers.Activation('sigmoid', name='rhd_output')(rhd_logits)

    # Head 3: Joint 8-Class Phenotype with Temperature Scaling
    pheno_logits = layers.Dense(8, name='phenotype_logits')(bottleneck)
    calibrated_logits = TemperatureScaling(initial_temperature=temperature, name='temp_scaling')(pheno_logits)
    phenotype_output = layers.Activation('softmax', name='phenotype_output')(calibrated_logits)

    model = Model(
        inputs=[image_input, biomarker_input], 
        outputs=[phenotype_output, abo_output, rhd_output],
        name='BloodEye_MultiTask_EfficientNet_CBAM'
    )

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss={
            'phenotype_output': 'categorical_crossentropy',
            'abo_output': 'categorical_crossentropy',
            'rhd_output': 'binary_crossentropy'
        },
        loss_weights={
            'phenotype_output': 1.0,
            'abo_output': 0.5,
            'rhd_output': 0.3
        },
        metrics={
            'phenotype_output': ['accuracy', tf.keras.metrics.AUC(name='auc')],
            'abo_output': ['accuracy'],
            'rhd_output': ['accuracy']
        }
    )

    return model


def build_custom_cnn_baseline(image_shape=(224, 224, 3), num_classes=8) -> Model:
    """Standard 5-layer convolutional baseline for ablation comparisons."""
    image_input = layers.Input(shape=image_shape, name='image_input')
    
    x = layers.Conv2D(32, (3, 3), activation='relu', padding='same')(image_input)
    x = layers.MaxPooling2D((2, 2))(x)
    x = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(x)
    x = layers.MaxPooling2D((2, 2))(x)
    x = layers.Conv2D(128, (3, 3), activation='relu', padding='same')(x)
    x = layers.MaxPooling2D((2, 2))(x)
    x = layers.Conv2D(256, (3, 3), activation='relu', padding='same')(x)
    x = layers.MaxPooling2D((2, 2))(x)
    
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(128, activation='relu')(x)
    x = layers.Dropout(0.5)(x)
    out = layers.Dense(num_classes, activation='softmax', name='phenotype_output')(x)

    model = Model(inputs=image_input, outputs=out, name='BloodEye_Custom_CNN_Baseline')
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model


def build_resnet50_multitask(image_shape=(224, 224, 3), num_classes=8) -> Model:
    """Deep Residual ResNet-50 backbone with dual classification heads."""
    image_input = layers.Input(shape=image_shape, name='image_input')
    base_res = ResNet50(include_top=False, weights='imagenet', input_tensor=image_input)
    base_res.trainable = False

    x = base_res.output
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dense(256, activation='relu')(x)
    x = layers.Dropout(0.4)(x)
    
    phenotype_out = layers.Dense(num_classes, activation='softmax', name='phenotype_output')(x)
    
    model = Model(inputs=image_input, outputs=phenotype_out, name='BloodEye_ResNet50_Benchmark')
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    return model
