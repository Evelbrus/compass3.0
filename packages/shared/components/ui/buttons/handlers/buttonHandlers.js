'use client';
export function handleButtonClick(event, href, isClient, router, onClick) {
    if (href && isClient) {
        event.preventDefault();
        router.push(href);
    }
    if (onClick) {
        onClick(event);
    }
}
