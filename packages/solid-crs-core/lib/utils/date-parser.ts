import moment from 'moment';
import { ArgumentError } from '../errors/argument-error';
import { Translator } from '../i8n/translator';

/**
 * Formats a label which describes the time between the given timestamp and now.
 *
 * @param timestamp The unix time stamp to format.
 * @param translator A translator, which is used to translate the formatted time ago label.
 * @returns A formatted label of the time ago.
 */
export const getFormattedTimeAgo = (timestamp: number, translator: Translator): string => {

  if (!translator) {

    throw new ArgumentError('Argument translator should be set.', translator);

  }

  // Gets the current date and time.
  const now = moment(new Date());

  // Difference between now and the given timestamp.
  const difference = moment.duration(now.diff(timestamp));
  const minutes = Math.round(difference.asMinutes());

  if (minutes < 60) {

    // Less than an hour ago.

    if (minutes < 2) {

      return translator.translate('common.date.just-now');

    } else {

      return `${minutes} ${translator.translate('common.date.minutes-ago')}`;

    }

  } else {

    // More than an hour ago.

    const hours = Math.round(difference.asHours());

    if (hours < 24) {

      // Less than a day ago.

      return `${hours} ${hours === 1
        ? translator.translate('common.date.hour-ago')
        : translator.translate('common.date.hours-ago')}`;

    } else {

      const days = Math.round(difference.asDays());

      if (days < 31) {

        // Less than a month ago.

        return `${days} ${days === 1
          ? translator.translate('common.date.day-ago')
          : translator.translate('common.date.days-ago')}`;

      } else {

        const months = Math.round(difference.asMonths());

        if (months < 12) {

          // Less than a year ago.

          return `${months} ${months === 1
            ? translator.translate('common.date.month-ago')
            : translator.translate('common.date.months-ago')}`;

        } else {

          // More than a year ago.

          const years = Math.round(difference.asYears());

          return `${years} ${years === 1
            ? translator.translate('common.date.year-ago')
            : translator.translate('common.date.years-ago')}`;

        }

      }

    }

  }

};
