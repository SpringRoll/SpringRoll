export const newEvent = (eventName, bubble = false, cancelable = false) => {
  const event = document.createEvent('Event');
  event.initEvent(eventName, bubble, cancelable);
  return event;
};

//Small check to see if browser is IE11;
// @ts-ignore
export const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
