import { createDemoVerifier, DEMO_CODE, MAX_ATTEMPTS, RESEND_AFTER_SEC } from './verifier';

const PHONE = '+994501234567';

function setup() {
  let now = 0;
  const verifier = createDemoVerifier(() => now);
  const wait = (seconds: number) => {
    now += seconds * 1000;
  };
  return { verifier, wait };
}

describe('demo verifier', () => {
  it('approves the demo code as a new account', async () => {
    const { verifier } = setup();
    await verifier.sendCode(PHONE);
    await expect(verifier.checkCode(PHONE, DEMO_CODE)).resolves.toEqual({
      status: 'approved',
      isNewAccount: true,
    });
  });

  it('knows the demo accounts: their numbers sign in instead of starting a new account', async () => {
    const { verifier } = setup();
    await verifier.sendCode('+994500000004');
    await expect(verifier.checkCode('+994500000004', '246810')).resolves.toEqual({
      status: 'approved',
      isNewAccount: false,
    });
  });

  it('needs a sent code first', async () => {
    const { verifier } = setup();
    await expect(verifier.checkCode(PHONE, DEMO_CODE)).resolves.toEqual({ status: 'no_code' });
  });

  it('counts wrong attempts down and then locks the code', async () => {
    const { verifier } = setup();
    await verifier.sendCode(PHONE);
    await expect(verifier.checkCode(PHONE, '000000')).resolves.toEqual({
      status: 'wrong',
      attemptsLeft: MAX_ATTEMPTS - 1,
    });
    await verifier.checkCode(PHONE, '000000');
    await expect(verifier.checkCode(PHONE, '000000')).resolves.toEqual({ status: 'locked' });
    await expect(verifier.checkCode(PHONE, DEMO_CODE)).resolves.toEqual({ status: 'locked' });
  });

  it('limits how often a code is sent, and a new code resets the attempts', async () => {
    const { verifier, wait } = setup();
    await verifier.sendCode(PHONE);
    wait(20);
    await expect(verifier.sendCode(PHONE)).resolves.toEqual({
      status: 'too_soon',
      retryAfterSec: RESEND_AFTER_SEC - 20,
    });
    for (let i = 0; i < MAX_ATTEMPTS; i++) await verifier.checkCode(PHONE, '000000');
    wait(RESEND_AFTER_SEC);
    await expect(verifier.sendCode(PHONE)).resolves.toEqual({
      status: 'sent',
      resendAfterSec: RESEND_AFTER_SEC,
    });
    await expect(verifier.checkCode(PHONE, DEMO_CODE)).resolves.toMatchObject({
      status: 'approved',
    });
  });
});
