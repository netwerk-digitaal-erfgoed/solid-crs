import moment from 'moment';
import { Translator } from '../i8n/translator';

export const getFormattedTimeAgo = (timestamp: number, translator: Translator): string => {
  const now = moment(new Date());
  const duration = moment.duration(now.diff(timestamp));
  const minutes = Math.round(duration.asMinutes());
  if (minutes < 60) {
    if (minutes < 2) {
      return translator.translate('nde.common.date.just-now');
    } else {
      return `${minutes} ${translator.translate('nde.common.date.minutes-ago')}`;
    }
  } else {
    const hours = Math.round(duration.asHours());
    if (hours < 24) {
      return `${hours} ${hours === 1
        ? translator.translate('nde.common.date.hour-ago')
        : translator.translate('nde.common.date.hours-ago')}`;
    } else {
      const days = Math.round(duration.asDays());
      if (days < 31) {
        return `${days} ${days === 1
          ? translator.translate('nde.common.date.day-ago')
          : translator.translate('nde.common.date.days-ago')}`;
      } else {
        const months = Math.round(duration.asMonths());
        if (months < 12) {
          return `${months} ${months === 1
            ? translator.translate('nde.common.date.month-ago')
            : translator.translate('nde.common.date.months-ago')}`;
        } else {
          const years = Math.round(duration.asYears());
          return `${years} ${years === 1
            ? translator.translate('nde.common.date.year-ago')
            : translator.translate('nde.common.date.years-ago')}`;
        }
      }
    }
  }
};
