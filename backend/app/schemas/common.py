from typing import Any


class APIResponse:
    @staticmethod
    def success(
        message: str | None = None,
        data: Any = None,
    ):
        response = {
            "success": True,
        }

        if message:
            response["message"] = message

        if data is not None:
            response["data"] = data

        return response