class Singleton(type):
    """
    A metaclass for creating singleton classes, i.e. a class that only has one instance at max.
    """
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            instance = super().__call__(*args, **kwargs)
            cls._instances[cls] = instance
        return cls._instances[cls]
