from sqlalchemy.ext.mutable import Mutable

class MutableObject(Mutable, object):
    @classmethod
    def coerce(cls, key, value):
        return value

    def __getstate__(self): 
        d = self.__dict__.copy()
        d.pop('_parents', None)
        return d

    def __setstate__(self, state):
        self.__dict__ = state

    def __setattr__(self, name, value):
        object.__setattr__(self, name, value)
        self.changed()

class MutableValue[T](MutableObject):
    def __init__(self, value: T):
        super(MutableObject, self).__init__()
        self.value = value