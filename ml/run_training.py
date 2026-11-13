import argparse
import os
import json
import numpy as np
import pandas as pd
from models.baseline_cnn import build_baseline_cnn
from models.efficientnet_model import build_efficientnet
from models.resnet_model import build_resnet50
from training.trainer import train_model
from training.data_generator import create_tf_dataset
from preprocessing.dataset_builder import build_dataset_from_directory, split_dataset, compute_class_weights
from evaluation.evaluator import evaluate_model
from evaluation.visualizations import plot_history, plot_confusion_matrix
from config import DISCLAIMER, AVAILABLE_ARCHITECTURES
from utils import set_all_seeds

def main():
    parser = argparse.ArgumentParser(description='Train BloodEye Model')
    parser.add_argument('--model', type=str, choices=AVAILABLE_ARCHITECTURES, default='baseline_cnn')
    parser.add_argument('--data_dir', type=str, required=True)
    parser.add_argument('--epochs', type=int, default=10)
    parser.add_argument('--batch_size', type=int, default=32)
    parser.add_argument('--out_dir', type=str, default='./outputs')
    args = parser.parse_args()
    
    print(DISCLAIMER)
    set_all_seeds()
    os.makedirs(args.out_dir, exist_ok=True)
    
    print(f"Loading data from {args.data_dir}...")
    df = build_dataset_from_directory(args.data_dir)
    
    train_df, val_df = split_dataset(df)
    
    class_weights = compute_class_weights(train_df['label'].values)
    
    train_ds = create_tf_dataset(train_df['filepath'].values, train_df['label'].values, batch_size=args.batch_size, is_training=True)
    val_ds = create_tf_dataset(val_df['filepath'].values, val_df['label'].values, batch_size=args.batch_size, is_training=False)
    
    print(f"Building {args.model}...")
    if args.model == 'baseline_cnn':
        model = build_baseline_cnn()
    elif args.model == 'efficientnetb0':
        model = build_efficientnet()
    else:
        model = build_resnet50()
        
    model.summary()
    
    print(f"Training for {args.epochs} epochs...")
    history = train_model(model, train_ds, val_ds, epochs=args.epochs, class_weights=class_weights, save_dir=args.out_dir)
    
    plot_history(history.history, os.path.join(args.out_dir, 'training_curves.png'))
    
    print("Evaluating model...")
    # we evaluate on validation set as proxy for test set here
    val_images, val_labels = next(iter(val_ds.unbatch().batch(len(val_df))))
    results = evaluate_model(model, val_images, val_labels.numpy())
    
    with open(os.path.join(args.out_dir, 'metrics.json'), 'w') as f:
        json.dump(results, f, indent=4)
        
    plot_confusion_matrix(np.array(results['confusion_matrix']), ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], os.path.join(args.out_dir, 'confusion_matrix.png'))
    
    print(f"Evaluation Results:\nAccuracy: {results['accuracy']:.4f} (Random Baseline: {results['random_baseline']:.4f})")
    print(f"Balanced Accuracy: {results['balanced_accuracy']:.4f}")
    
if __name__ == '__main__':
    main()
