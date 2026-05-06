def invoke(action, payload, request):
    if action == "echo":
        return {"ok": True, "message": payload.get("message", "")}
    raise ValueError(f"unknown action: {action}")
