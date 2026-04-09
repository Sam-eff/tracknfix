import logging
import re
from django.conf import settings

logger = logging.getLogger(__name__)


def _normalize_nigerian_number(phone: str) -> str:
    """
    Normalizes a Nigerian phone number to international format (+234...).
    Handles formats like: 08012345678, 8012345678, +2348012345678, 2348012345678
    """
    phone = re.sub(r"[\s\-()]", "", phone)  # strip spaces, dashes, brackets

    if phone.startswith("+234"):
        return phone
    if phone.startswith("234"):
        return f"+{phone}"
    if phone.startswith("0") and len(phone) == 11:
        return f"+234{phone[1:]}"
    if len(phone) == 10:
        return f"+234{phone}"

    # Fallback: just prepend + if not there
    return f"+{phone}" if not phone.startswith("+") else phone


def send_sms(to_number: str, message: str) -> bool:
    """
    Sends an SMS message using Africa's Talking.
    Returns True if successful, False otherwise.

    Set AT_USERNAME='sandbox' and AT_API_KEY='any-string' for free local testing.
    """
    api_key = getattr(settings, "AT_API_KEY", "")
    username = getattr(settings, "AT_USERNAME", "")
    sender_id = getattr(settings, "AT_SENDER_ID", "")

    if not api_key or not username:
        logger.warning("Africa's Talking credentials not configured. SMS not sent.")
        # In DEBUG mode, pretend it succeeded so development flows still work
        return bool(getattr(settings, "DEBUG", False))

    try:
        import africastalking

        africastalking.initialize(username, api_key)
        sms = africastalking.SMS

        to_number = _normalize_nigerian_number(to_number)

        kwargs = {
            "message": message,
            "recipients": [to_number],
        }
        if sender_id:
            kwargs["sender_id"] = sender_id

        response = sms.send(**kwargs)
        recipients = response.get("SMSMessageData", {}).get("Recipients", [])

        if recipients and recipients[0].get("status") == "Success":
            logger.info(f"SMS sent successfully to {to_number} via Africa's Talking.")
            return True
        else:
            logger.error(f"Africa's Talking SMS failed: {response}")
            return False

    except Exception as e:
        logger.error(f"Unexpected error when sending SMS via Africa's Talking: {e}")
        return False
