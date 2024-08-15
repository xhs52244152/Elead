import EventBus from './EventBus';

const EventBusInstance = new EventBus();
EventBusInstance.EventBus = EventBus;

export {
    EventBusInstance,
    EventBus
};

export default EventBusInstance;
