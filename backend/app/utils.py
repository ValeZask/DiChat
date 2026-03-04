from fastapi import Request

def get_client_ip(request: Request) -> str:
    """
    Читает IP клиента.
    Приоритет: X-Forwarded-For → X-Real-IP → request.client.host
    """
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # Может быть список: "client, proxy1, proxy2" — берём первый
        return forwarded_for.split(",")[0].strip()
    
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()
    
    return request.client.host