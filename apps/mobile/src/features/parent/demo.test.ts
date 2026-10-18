import {
  fetchAssignments,
  fetchChildren,
  fetchConversations,
  fetchReport,
  LinkCodeError,
  resetDemo,
  stopLink,
  submitConsent,
  submitLinkCode,
} from './demo';
import { DEMO_SMS_CODE, ELVIN, NERMIN } from './demoData';

beforeEach(resetDemo);

describe('demo parent server', () => {
  it('sends only what the child shares', async () => {
    const page = await fetchReport(NERMIN, 0);
    expect(page.report?.examReadiness).toBeNull();
    expect(page.hasPrevious).toBe(true);
    expect(await fetchAssignments(ELVIN)).toBeNull();
  });

  it('checks link codes in plain categories', async () => {
    await expect(submitLinkCode('m4t8qw')).rejects.toMatchObject({ reason: 'expired' });
    await expect(submitLinkCode('AAAAAA')).rejects.toMatchObject({ reason: 'not_found' });
    await expect(submitLinkCode('K7Q42M')).rejects.toBeInstanceOf(LinkCodeError);
    await stopLink(NERMIN);
    await expect(submitLinkCode('k7q42m')).resolves.toMatchObject({ childName: 'Nərmin' });
  });

  it('closes the teacher conversation when the link stops', async () => {
    expect(await fetchConversations()).toHaveLength(1);
    await stopLink(NERMIN);
    expect(await fetchConversations()).toHaveLength(0);
  });

  it('opens an under-13 account only with the right SMS code', async () => {
    await expect(submitConsent(ELVIN, '000000')).rejects.toThrow('wrong_code');
    await submitConsent(ELVIN, DEMO_SMS_CODE);
    const elvin = (await fetchChildren()).find((c) => c.childId === ELVIN);
    expect(elvin?.status).toBe('active');
    expect(elvin?.grants).toEqual(['report', 'progress', 'assignments']);
  });
});
