package fyp;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public final class Utilities {
	static final double MILLISECONDS_TO_SECONDS = 1000;
	
	static final ZonedDateTime PAST = ZonedDateTime.of(2015, 1, 1, 0, 0, 0, 0, ZoneId.of("Asia/Hong_Kong"));

	/**
	 * 
	 * @param timestampInMillis
	 * @return
	 */
	final static ZonedDateTime timestampToTime(final long timestampInMillis) {
		return ZonedDateTime.ofInstant(Instant.ofEpochMilli(timestampInMillis), ZoneId.of("Asia/Hong_Kong"));
	}

	/**
	 * 
	 * @param start The start time of the period, as {@code ZonedDateTime} objects.
	 * @param end The end time of the period, as {@code ZonedDateTime} objects.
	 * @return
	 * @throws IllegalArgumentException
	 */
	final static long[] timeToPeriod(final ZonedDateTime start, final ZonedDateTime end) throws IllegalArgumentException {
		if (start.isBefore(PAST))
			throw new IllegalArgumentException("Starting time too early: " + start); // The system was not there such early...... this means invalid data
		if (start.isBefore(end))
			return new long[] {start.toInstant().toEpochMilli(), end.toInstant().toEpochMilli()};
		throw new IllegalArgumentException("The starting time must be earlier than the end time");
	}
}