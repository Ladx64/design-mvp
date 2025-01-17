"""Welcome to Reflex! This file outlines the steps to create a basic app."""

import reflex as rx


class State(rx.State):
    """The app state."""

    img: str

    @rx.event
    async def handle_upload(self, files: list[rx.UploadFile]) -> None:
        for file in files:
            upload_data = await file.read()
            outfile = rx.get_upload_dir() / file.filename

            with outfile.open("wb") as f:
                f.write(upload_data)

            self.img = str(file.filename)

            print(self.img)

        return rx.redirect("/analysis")


@rx.page(route="/", title="Design Analysis")
def index() -> rx.Component:
    # Welcome Page (Index)
    return rx.container(
        rx.color_mode.button(position="top-right"),
        rx.vstack(
            rx.heading("Design Analysis!", size="9"),
            rx.text(
                "Get started by uploading your file",
                size="5",
            ),
            rx.upload(
                rx.vstack(
                    rx.button("Select File"),
                    rx.text("or drag and drop"),
                ),
                id="upload1",
                width="100%",
            ),
            rx.hstack(
                rx.foreach(rx.selected_files("upload1"), rx.text),
            ),
            rx.hstack(
                rx.button(
                    "Analyse",
                    color_scheme="green",
                    on_click=State.handle_upload(rx.upload_files(upload_id="upload1")),
                ),
            ),
            spacing="5",
            justify="center",
            min_height="85vh",
        ),
    )


@rx.page(route="/analysis", title="Design Analysis")
def analysis() -> rx.Component:
    return rx.container(
        rx.color_mode.button(position="top-right"),
        rx.heading("Analysis", size="9"),
        rx.image(src=rx.get_upload_url(State.img), width="100%"),
        rx.button("Back", color_scheme="blue", on_click=rx.redirect("/")),
        spacing="5",
        justify="center",
        min_height="85vh",
    )


app = rx.App()
