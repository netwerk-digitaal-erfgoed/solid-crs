import moment from 'moment';
import { ArgumentError } from '../errors/argument-error';
import { getFormattedTimeAgo } from './date-parser';

describe('getFormattedTimeAgo()', () => {

  const mockedTranslator = {
    translate: (key: string) => key.split('.')[key.split('.').length - 1],
  };

  it('just now', () => {

    const result = getFormattedTimeAgo(+moment(new Date()), mockedTranslator);
    expect(result).toBe('just-now');

  });

  it('should throw error when no translator is given', () => {

    expect(() => getFormattedTimeAgo(+moment(new Date()), null)).toThrow(ArgumentError);

  });

  it('x minutes ago', () => {

    const minutes = 5;
    const result = getFormattedTimeAgo(+moment(+new Date() - minutes * 60 * 1000), mockedTranslator);
    expect(result).toBe(`${minutes} minutes-ago`);

  });

  it('1 hour ago', () => {

    const hours = 1;
    const result = getFormattedTimeAgo(+moment(+new Date() - hours * 60 * 60 * 1000), mockedTranslator);
    expect(result).toBe(`${hours} hour-ago`);

  });

  it('x hours ago', () => {

    const hours = 6;
    const result = getFormattedTimeAgo(+moment(+new Date() - hours * 60 * 60 * 1000), mockedTranslator);
    expect(result).toBe(`${hours} hours-ago`);

  });

  it('1 day ago', () => {

    const days = 1;
    const result = getFormattedTimeAgo(+moment(+new Date() - days * 24 * 60 * 60 * 1000), mockedTranslator);
    expect(result).toBe(`${days} day-ago`);

  });

  it('x days ago', () => {

    const days = 6;
    const result = getFormattedTimeAgo(+moment(+new Date() - days * 24 * 60 * 60 * 1000), mockedTranslator);
    expect(result).toBe(`${days} days-ago`);

  });

  it('1 month ago', () => {

    const months = 1;
    const result = getFormattedTimeAgo(+moment(+new Date() - months * 31 * 24 * 60 * 60 * 1000), mockedTranslator);
    expect(result).toBe(`${months} month-ago`);

  });

  it('x months ago', () => {

    const months = 6;
    const result = getFormattedTimeAgo(+moment(+new Date() - months * 31 * 24 * 60 * 60 * 1000), mockedTranslator);
    expect(result).toBe(`${months} months-ago`);

  });

  it('1 year ago', () => {

    const years = 1;
    const result = getFormattedTimeAgo(+moment(+new Date() - years * 12 * 31 * 24 * 60 * 60 * 1000), mockedTranslator);
    expect(result).toBe(`${years} year-ago`);

  });

  it('x years ago', () => {

    const years = 6;
    const result = getFormattedTimeAgo(+moment(+new Date() - years * 12 * 31 * 24 * 60 * 60 * 1000), mockedTranslator);
    expect(result).toBe(`${years} years-ago`);

  });

});
