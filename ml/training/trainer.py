import os
import json
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau, CSVLogger

def train_model(model, train_data, val_data, epochs=50, class_weights=None, save_dir='./outputs'):
    os.makedirs(save_dir, exist_ok=True)
    callbacks = [
        ModelCheckpoint(os.path.join(save_dir, 'best_model.h5'), save_best_only=True),
        EarlyStopping(patience=10, restore_best_weights=True),
        ReduceLROnPlateau(factor=0.5, patience=5),
        CSVLogger(os.path.join(save_dir, 'training_log.csv'))
    ]
    
    history = model.fit(
        train_data,
        validation_data=val_data,
        epochs=epochs,
        class_weight=class_weights,
        callbacks=callbacks
    )
    
    with open(os.path.join(save_dir, 'history.json'), 'w') as f:
        json.dump(history.history, f)
        
    model.save(os.path.join(save_dir, 'final_model.h5'))
    return history
