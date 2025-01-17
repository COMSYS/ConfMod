from pydantic import BaseModel
from libconfmod.config.raw import RawConfmodConfig

class ConfigBase(BaseModel):
    pass

class ConfigGetAll(ConfigBase):
    name: str
    slug: str

class ConfigGetOne(ConfigBase):
    name: str
    config: RawConfmodConfig

class ConfigCreate(ConfigBase):
    name: str
    config: RawConfmodConfig

class ConfigUpdate(ConfigBase):
    config: RawConfmodConfig

class ConfigRename(ConfigBase):
    name: str