from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, SQLModel, Field, select
from typing import Optional

from ..database import get_session


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    title: str
    message: str
    type: str = "info"
    is_read: bool = False
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"],
)


@router.get("/{user_id}")
def get_notifications(
    user_id: int,
    session: Session = Depends(get_session),
):
    notifications = session.exec(
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
    ).all()

    return notifications


@router.post("/")
def create_notification(
    user_id: int,
    title: str,
    message: str,
    type: str = "info",
    session: Session = Depends(get_session),
):
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
    )

    session.add(notification)
    session.commit()
    session.refresh(notification)

    return notification


@router.put("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    session: Session = Depends(get_session),
):
    notification = session.get(
        Notification,
        notification_id,
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    notification.is_read = True

    session.add(notification)
    session.commit()
    session.refresh(notification)

    return notification


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    session: Session = Depends(get_session),
):
    notification = session.get(
        Notification,
        notification_id,
    )

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found",
        )

    session.delete(notification)
    session.commit()

    return {
        "message": "Notification deleted successfully"
    }