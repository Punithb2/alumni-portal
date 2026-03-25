from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return response

    data = response.data
    message = None
    errors = {}

    if isinstance(data, dict):
        if 'detail' in data:
            message = str(data.get('detail'))
        else:
            errors = data
            if data:
                first_value = next(iter(data.values()))
                if isinstance(first_value, list) and first_value:
                    message = str(first_value[0])
                elif isinstance(first_value, str):
                    message = first_value
    elif isinstance(data, list):
        errors = {'non_field_errors': data}
        if data:
            message = str(data[0])
    else:
        message = str(data)

    response.data = {
        'status': 'error',
        'code': response.status_code,
        'message': message or 'Request failed.',
        'errors': errors,
    }
    return response

