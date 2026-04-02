import flet as ft
import numpy as np
import asyncio
import os
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image as keras_image

# Path to the model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "resnet34_model.h5")

async def main(page: ft.Page):
    page.title = "Parcel Guard - Damage Classification"
    page.theme_mode = "dark"
    page.padding = 0
    page.window_width = 450
    page.window_height = 800
    page.fonts = {
        "Outfit": "https://github.com/google/fonts/raw/main/ofl/outfit/Outfit-VariableFont_wght.ttf"
    }
    page.theme = ft.Theme(font_family="Outfit")

    # App State
    state = {
        "model": None,
        "class_names": ['Not_Damaged', 'Damaged'],
        "selected_path": None,
    }

    # Load model
    try:
        state["model"] = load_model(MODEL_PATH)
    except Exception as e:
        print(f"Error loading model: {e}")

    # --- UI Components ---
    selected_image = ft.Image(
        src="",
        width=300,
        height=300,
        fit="cover",
        border_radius=15,
        visible=False,
    )

    image_container = ft.Container(
        content=ft.Icon("image_outlined", size=100, color="white,0.3"),
        width=300,
        height=300,
        bgcolor="white,0.1",
        border_radius=15,
        alignment="center",
        border=ft.border.all(1, "white,0.2"),
    )

    result_text = ft.Text("", size=24, weight="bold", text_align="center")
    confidence_text = ft.Text("", size=18, color="bluegrey200")
    loading_indicator = ft.ProgressRing(visible=False, color="cyanaccent")

    file_picker = ft.FilePicker()
    page.overlay.append(file_picker)
    await page.update_async()

    async def pick_image(e):
        result = await file_picker.pick_files_async(
            allow_multiple=False,
            file_type="image"
        )
        if result and result.files:
            file_path = result.files[0].path
            state["selected_path"] = file_path
            selected_image.src = file_path
            selected_image.visible = True
            image_container.content = selected_image
            predict_button.disabled = False
            result_text.value = ""
            confidence_text.value = ""
            await page.update_async()

    async def predict_click(e):
        file_path = state.get("selected_path")
        if not file_path:
            return

        if state["model"] is None:
            page.snack_bar = ft.SnackBar(ft.Text("Model not loaded yet!"))
            page.snack_bar.open = True
            await page.update_async()
            return

        loading_indicator.visible = True
        predict_button.disabled = True
        await page.update_async()

        try:
            # Preprocess image
            img = keras_image.load_img(file_path, target_size=(256, 256))
            img_array = keras_image.img_to_array(img) / 255.0
            img_array = np.expand_dims(img_array, axis=0)

            # Run prediction in thread to avoid blocking UI
            prediction = await asyncio.get_event_loop().run_in_executor(
                None, lambda: state["model"].predict(img_array)[0]
            )

            if len(prediction) == 1:  # sigmoid model
                prob = float(prediction)
                if prob >= 0.6:
                    predicted_class = "DAMAGED"
                    confidence = prob
                    result_text.color = "#EF5350"
                elif prob <= 0.4:
                    predicted_class = "NOT DAMAGED"
                    confidence = 1 - prob
                    result_text.color = "#66BB6A"
                else:
                    predicted_class = "NON-PARCEL IMAGE"
                    confidence = prob
                    result_text.color = "#FFA726"
            else:  # softmax model
                confidence = float(np.max(prediction))
                label_idx = int(np.argmax(prediction))
                predicted_class = state["class_names"][label_idx].replace('_', ' ').upper()

                if confidence < 0.60:
                    predicted_class = "NON-PARCEL IMAGE"
                    result_text.color = "#FFA726"
                elif "DAMAGED" in predicted_class and "NOT" not in predicted_class:
                    result_text.color = "#EF5350"
                else:
                    result_text.color = "#66BB6A"

            result_text.value = predicted_class
            confidence_text.value = f"Confidence: {confidence:.2%}"

        except Exception as ex:
            result_text.value = "ERROR"
            confidence_text.value = str(ex)
            result_text.color = "#EF5350"

        loading_indicator.visible = False
        predict_button.disabled = False
        await page.update_async()

    pick_button = ft.Container(
        content=ft.Row(
            [ft.Icon("add_a_photo", color="white"), ft.Text("Select Parcel Image", weight="bold", color="white")],
            alignment="center",
        ),
        padding=15,
        bgcolor="#00838F",
        border_radius=10,
        on_click=pick_image,
        ink=True,
    )

    predict_button = ft.ElevatedButton(
        content=ft.Text("ANALYZE DAMAGE", weight="bold"),
        style=ft.ButtonStyle(
            color="white",
            bgcolor={"": "#3949AB", "disabled": "#424242"},
            padding=20,
            shape=ft.RoundedRectangleBorder(radius=10),
        ),
        on_click=predict_click,
        disabled=True,
    )

    header = ft.Container(
        content=ft.Column(
            [
                ft.Text("PARCEL GUARD", size=28, weight="black", color="#00E5FF", letter_spacing=2),
                ft.Text("AI-Powered Damage Detection", size=14, color="#B0BEC5"),
            ],
            horizontal_alignment="center",
        ),
        padding=ft.padding.symmetric(vertical=40, horizontal=20),
        gradient=ft.LinearGradient(
            begin="topCenter",
            end="bottomCenter",
            colors=["#1A237E", "transparent"]
        )
    )

    main_content = ft.Container(
        content=ft.Column(
            [
                image_container,
                ft.Divider(height=20, color="transparent"),
                pick_button,
                predict_button,
                ft.Divider(height=20, color="transparent"),
                loading_indicator,
                result_text,
                confidence_text,
            ],
            horizontal_alignment="center",
            spacing=10,
        ),
        padding=20,
    )

    page.add(
        ft.Stack(
            [
                ft.Container(
                    expand=True,
                    gradient=ft.LinearGradient(
                        begin="topLeft",
                        end="bottomRight",
                        colors=["#263238", "#000000"]
                    )
                ),
                ft.Column(
                    [
                        header,
                        main_content
                    ],
                    scroll="adaptive",
                )
            ]
        )
    )

if __name__ == "__main__":
    ft.app(target=main)
