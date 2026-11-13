"""
Train combined plant disease classifier.

Dataset:
ml-service/disease_detection/data/plantvillage/

Classes are read automatically from folder names.

Combined dataset:
- PlantVillage classes
- Rice classes
- Wheat classes
"""

from pathlib import Path
import tensorflow as tf

# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE = Path(__file__).parent
DATA = BASE / "data" / "plantvillage"
OUT = BASE / "model"

OUT.mkdir(exist_ok=True)

# --------------------------------------------------
# CONFIG
# --------------------------------------------------

IMG = (224, 224)
BATCH = 32
SEED = 42

# Stage 1: train classifier head
HEAD_EPOCHS = 6

# Stage 2: fine-tune MobileNetV3Small
FINE_TUNE_EPOCHS = 6

# --------------------------------------------------
# CHECK DATASET
# --------------------------------------------------

if not DATA.exists() or not any(DATA.iterdir()):
    raise SystemExit(
        f"Dataset not found: {DATA}"
    )

# --------------------------------------------------
# LOAD DATASET
# --------------------------------------------------

train_ds = tf.keras.utils.image_dataset_from_directory(
    DATA,
    validation_split=0.2,
    subset="training",
    seed=SEED,
    image_size=IMG,
    batch_size=BATCH,
    label_mode="int",
    shuffle=True
)

val_ds = tf.keras.utils.image_dataset_from_directory(
    DATA,
    validation_split=0.2,
    subset="validation",
    seed=SEED,
    image_size=IMG,
    batch_size=BATCH,
    label_mode="int",
    shuffle=False
)

classes = train_ds.class_names

print("\n====================================")
print(f"Total classes: {len(classes)}")
print("====================================")

for i, name in enumerate(classes):
    print(f"{i}: {name}")

# Save labels
(OUT / "labels.txt").write_text(
    "\n".join(classes),
    encoding="utf-8"
)

# --------------------------------------------------
# PERFORMANCE
# --------------------------------------------------

AUTOTUNE = tf.data.AUTOTUNE

train_ds = train_ds.prefetch(AUTOTUNE)
val_ds = val_ds.prefetch(AUTOTUNE)

# --------------------------------------------------
# DATA AUGMENTATION
# --------------------------------------------------

augmentation = tf.keras.Sequential([
    tf.keras.layers.RandomFlip("horizontal"),
    tf.keras.layers.RandomRotation(0.08),
    tf.keras.layers.RandomZoom(0.10),
], name="augmentation")

# --------------------------------------------------
# BASE MODEL
# --------------------------------------------------

base = tf.keras.applications.MobileNetV3Small(
    input_shape=(*IMG, 3),
    include_top=False,
    weights="imagenet",
    include_preprocessing=True
)

# First stage: freeze pretrained model
base.trainable = False

# --------------------------------------------------
# MODEL
# --------------------------------------------------

inputs = tf.keras.Input(shape=(*IMG, 3))

x = augmentation(inputs)

x = base(x, training=False)

x = tf.keras.layers.GlobalAveragePooling2D()(x)

x = tf.keras.layers.Dropout(0.30)(x)

outputs = tf.keras.layers.Dense(
    len(classes),
    activation="softmax"
)(x)

model = tf.keras.Model(inputs, outputs)

# --------------------------------------------------
# STAGE 1
# --------------------------------------------------

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

print("\n====================================")
print("STAGE 1: Training classifier head")
print("====================================\n")

model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=HEAD_EPOCHS,
    callbacks=[
        tf.keras.callbacks.EarlyStopping(
            monitor="val_accuracy",
            patience=2,
            restore_best_weights=True
        )
    ]
)

# --------------------------------------------------
# STAGE 2 - FINE TUNING
# --------------------------------------------------

print("\n====================================")
print("STAGE 2: Fine-tuning MobileNetV3Small")
print("====================================\n")

base.trainable = True

# Freeze early layers.
# Train only the later feature-extraction layers.
for layer in base.layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=1e-5
    ),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=FINE_TUNE_EPOCHS,
    callbacks=[
        tf.keras.callbacks.EarlyStopping(
            monitor="val_accuracy",
            patience=2,
            restore_best_weights=True
        ),
        tf.keras.callbacks.ModelCheckpoint(
            OUT / "plant_disease.keras",
            monitor="val_accuracy",
            save_best_only=True
        )
    ]
)

# --------------------------------------------------
# FINAL EVALUATION
# --------------------------------------------------

evaluation = model.evaluate(
    val_ds,
    verbose=1
)

(OUT / "metrics.txt").write_text(
    f"validation_loss={evaluation[0]:.6f}\n"
    f"validation_accuracy={evaluation[1]:.6f}\n"
    f"classes={len(classes)}\n",
    encoding="utf-8"
)

print("\n====================================")
print("TRAINING COMPLETE")
print("====================================")
print(f"Classes: {len(classes)}")
print(f"Model: {OUT / 'plant_disease.keras'}")
print(f"Labels: {OUT / 'labels.txt'}")
print(f"Metrics: {OUT / 'metrics.txt'}")