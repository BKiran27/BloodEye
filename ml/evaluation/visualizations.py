import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os

def plot_confusion_matrix(cm, classes, save_path):
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=classes, yticklabels=classes)
    plt.title('Confusion Matrix')
    plt.ylabel('True label')
    plt.xlabel('Predicted label')
    plt.savefig(save_path)
    plt.close()

def plot_history(history_dict, save_path):
    plt.figure(figsize=(12, 4))
    plt.subplot(1, 2, 1)
    plt.plot(history_dict['accuracy'], label='Train Acc')
    plt.plot(history_dict['val_accuracy'], label='Val Acc')
    plt.legend()
    plt.subplot(1, 2, 2)
    plt.plot(history_dict['loss'], label='Train Loss')
    plt.plot(history_dict['val_loss'], label='Val Loss')
    plt.legend()
    plt.savefig(save_path)
    plt.close()
