from typing import Union
from fastapi import APIRouter

router = APIRouter(
    prefix="/functions"
)

@router.get("/")
def get_for_data_type(data_type: Union[str | None] = None):
    if data_type:
        pass