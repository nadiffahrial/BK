import { Building, RoomScheduleItem } from '../types';

const CAMPUS_TIME_ZONE = 'Asia/Jakarta';

const getCampusClock = (date: Date) => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: CAMPUS_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(date);
  const hour = Number(parts.find(part => part.type === 'hour')?.value || 0);
  const minute = Number(parts.find(part => part.type === 'minute')?.value || 0);
  const dateParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CAMPUS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const dateKey = `${dateParts.find(part => part.type === 'year')?.value}-${dateParts.find(part => part.type === 'month')?.value}-${dateParts.find(part => part.type === 'day')?.value}`;
  const day = new Intl.DateTimeFormat('id-ID', { timeZone: CAMPUS_TIME_ZONE, weekday: 'long' }).format(date).toLocaleLowerCase('id-ID');
  return { minutes: hour * 60 + minute, dateKey, day };
};

const getScheduleMinutes = (timeRange: string): [number, number] | null => {
  const match = timeRange.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return [Number(match[1]) * 60 + Number(match[2]), Number(match[3]) * 60 + Number(match[4])];
};

const findActiveSchedule = (schedules: RoomScheduleItem[], clock: ReturnType<typeof getCampusClock>) => schedules.find(schedule => {
    if (!schedule.day || schedule.day.toLocaleLowerCase('id-ID') !== clock.day) return false;
    if (schedule.holidayDates?.includes(clock.dateKey)) return false;
    const range = getScheduleMinutes(schedule.timeRange);
    return Boolean(range && clock.minutes >= range[0] && clock.minutes < range[1]);
  });

export const getActiveRoomSchedule = (schedules: RoomScheduleItem[], now = new Date()): RoomScheduleItem | undefined => {
  return findActiveSchedule(schedules, getCampusClock(now));
};

export const applyScheduleStatus = (buildings: Building[], now = new Date()): Building[] => {
  const clock = getCampusClock(now);
  return buildings.map(building => ({
    ...building,
    floors: building.floors.map(floor => ({
      ...floor,
      rooms: floor.rooms.map(room => {
        const activeSchedule = findActiveSchedule(room.schedule || [], clock);
        const isUnavailable = room.status === 'maintenance' || room.status === 'broken';
        if (!activeSchedule) {
          return {
            ...room,
            status: isUnavailable ? room.status : 'available',
            currentActivity: undefined
          };
        }
        const [startTime, endTime] = activeSchedule.timeRange.split(/\s*-\s*/);
        return {
          ...room,
          status: isUnavailable ? room.status : 'occupied',
          currentActivity: {
            title: activeSchedule.title,
            personInCharge: activeSchedule.organizer,
            department: activeSchedule.type || 'Agenda kampus',
            startTime,
            endTime,
            className: activeSchedule.className
          }
        };
      })
    }))
  }));
};
