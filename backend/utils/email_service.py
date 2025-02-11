import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from core.config import Settings

def create_html_email_body(new_password):
    """Creates an HTML email with a styled, copyable password box."""
    email_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; height: 100%; display: flex; align-items: center; justify-content: center;">
            <div style="
                max-width: 600px;
                width: 100%;
                margin: 20px;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                text-align: center;">
                <p style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 10px;">Добрый день!</p>
                <p style="font-size: 16px; color: #4b5563; margin-bottom: 20px;">Ваш новый пароль:</p>
                <div style="
                    margin: 0 auto 20px;
                    padding: 15px 25px;
                    background-color: #f9fafb;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 20px;
                    font-weight: bold;
                    color: #1f2937;
                    word-break: break-word;">
                    {new_password}
                </div>
                <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
                    Вы можете скопировать пароль, выделив его и нажав <b>Ctrl+C</b> (или <b>Cmd+C</b> на Mac).
                </p>
                <p style="font-size: 14px; color: #6b7280;">
                    С уважением,<br>Ваша команда
                </p>
            </div>
        </body>
    </html>
    """
    return email_body


def send_email_with_new_password(recipients, new_password):
    # Проверяем, что recipients — это список
    if isinstance(recipients, str):
        recipients = [recipients]

    # Создаем объект MIMEMultipart
    msg = MIMEMultipart()
    msg['From'] = Settings.EMAIL_SENDER
    msg['To'] = ', '.join(recipients)  # Join list into a comma-separated string
    msg['Subject'] = 'Ваш новый пароль!'

    # Создаем HTML-сообщение
    email_body = create_html_email_body(new_password)
    
    # Добавляем HTML часть письма
    msg.attach(MIMEText(email_body, 'html'))

    # Устанавливаем соединение с сервером SMTP
    try:
        with smtplib.SMTP(Settings.EMAIL_SERVER, Settings.EMAIL_PORT) as server:
            server.starttls()  # Шифрование соединения
            server.login(Settings.EMAIL_LOGIN, Settings.EMAIL_PASSWORD)
            # Отправляем письмо
            server.send_message(msg)
            print("Email sent successfully.")
            return 0
    except Exception as e:
        print(f"Failed to send email: {e}")
        return e