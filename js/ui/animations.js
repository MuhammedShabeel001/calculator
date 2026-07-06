export function createRipple(event, button) {
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    
    // For keyboard events, center the ripple
    if (event.clientX === 0 && event.clientY === 0) {
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${button.clientWidth / 2 - radius}px`;
        circle.style.top = `${button.clientHeight / 2 - radius}px`;
    } else {
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
    }

    circle.classList.add('ripple');

    const ripple = button.querySelector('.ripple');
    if (ripple) {
        ripple.remove();
    }

    button.appendChild(circle);
    
    // Remove after animation finishes (500ms)
    setTimeout(() => {
        circle.remove();
    }, 500);
}
