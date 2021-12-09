from jsons import JsonSerializable


class ApiResponse(JsonSerializable):
    def __init__(
        self,
        message: str = None,
        data: object = None,
        status: int = 200,
        success: bool = True,
        jwt: str = None,
        mood: list = [],
    ) -> None:
        self.Message = message
        self.Data = data
        self.Success = success
        self.Status = status
        self.Jwt = jwt
        self.Mood = mood
