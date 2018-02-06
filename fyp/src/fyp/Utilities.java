package fyp;

import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.Objects;
import java.util.TimeZone;

public class Utilities {
	/**
	 * 
	 * @param timestampInMillis
	 * @return
	 */
	public static GregorianCalendar timestampToTime(final long timestampInMillis) {
		Calendar c = new GregorianCalendar(TimeZone.getTimeZone("GMT+8:00"));
		c.setLenient(false);
		c.setTimeInMillis(timestampInMillis);
		return (GregorianCalendar) c;
	}

	/**
	 * 
	 * @param start The start time of the period, as {@code GregorianCalendar} objects.
	 * @param end The end time of the period, as {@code GregorianCalendar} objects.
	 * @return
	 * @throws IllegalArgumentException
	 */
	public static Long[] timeToPeriod(final GregorianCalendar startG, final GregorianCalendar endG) throws IllegalArgumentException {
		Long[] period = {timeToPeriod(startG)[0], timeToPeriod(endG)[0]};
		if (period[0] >= period[1])
			throw new IllegalArgumentException("The starting time must be earlier than the end time");
		return period;
	}

	/**
	 * Convert a human-readable date to UTC milliseconds from the epoch, optionally as a period of a second, a minute, an hour,
	 * a day, a month or a year. The human-readable date is in GMT+8:00 (Hong Kong time) time zone.
	 * @return A {@code Long} array with length 2, with its first element the start time, and the second one the end time.
	 * The second element in the array is optional.
	 * @throws IllegalArgumentException if year is less than 2015, or either of year, month, day, hour, minute or second is out of valid range.
	 */
	private static Long[] timeToPeriod(final GregorianCalendar g) throws IllegalArgumentException {
		int year = g.get(GregorianCalendar.YEAR), month = g.get(GregorianCalendar.MONTH) + 1, day = g.get(GregorianCalendar.DATE),
				hour = g.get(GregorianCalendar.HOUR_OF_DAY), minute = g.get(GregorianCalendar.MINUTE), second = g.get(GregorianCalendar.SECOND);
		Calendar c = new GregorianCalendar(TimeZone.getTimeZone("GMT+8:00"));
		c.clear();
		c.setLenient(false);
		Long[] time = new Long[2];
		if (Objects.nonNull(month))
			month--; // month -1 to fit with the month definition in the Calendar class.
		if (year < 2015)
			throw new IllegalArgumentException("Year too early: " + year); // The system was not there such early...... this means invalid data
		if (Objects.nonNull(second)) {
			c.set(year, month, day, hour, minute, second);
			time[0] = c.getTimeInMillis();
			c.add(Calendar.SECOND, 1);
		} else if (Objects.nonNull(minute)) {
			c.set(year, month, day, hour, minute, 0);
			time[0] = c.getTimeInMillis();
			c.add(Calendar.MINUTE, 1);
		} else if (Objects.nonNull(hour)) {
			c.set(year, month, day, hour, 0, 0);
			time[0] = c.getTimeInMillis();
			c.add(Calendar.HOUR_OF_DAY, 1);
		} else if (Objects.nonNull(day)) {
			c.set(year, month, day, 0, 0, 0);
			time[0] = c.getTimeInMillis();
			c.add(Calendar.DATE, 1);
		} else if (Objects.nonNull(month)) {
			c.set(year, month, 0, 0, 0, 0);
			time[0] = c.getTimeInMillis();
			c.add(Calendar.MONTH, 1);
		} else if (Objects.nonNull(year)) {
			c.set(year, 0, 0, 0, 0, 0);
			time[0] = c.getTimeInMillis();
			c.add(Calendar.YEAR, 1);
		} else
			throw new NullPointerException();
		time[1] = c.getTimeInMillis();
		return time;
	}
}