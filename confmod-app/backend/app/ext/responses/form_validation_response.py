from fastapi import status
from fastapi.responses import JSONResponse
from ...schema.shared import FormValidationError

class FormValidationResponse(JSONResponse):
    
    def render(self, message: str | None) -> bytes:
        if message is None:
            self.status_code = status.HTTP_204_NO_CONTENT
            return super().render("")

        content = FormValidationError(message=message).model_dump()
        return super().render(content)