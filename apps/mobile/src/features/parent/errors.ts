/** Why a link code was not accepted; the screen says it in plain words. */
export class LinkCodeError extends Error {
  constructor(
    readonly reason: 'expired' | 'not_found' | 'already_linked',
    readonly childName: string | null = null,
  ) {
    super(reason);
  }
}

/** The SMS code typed for a child's consent is not the one sent. */
export class ConsentCodeError extends Error {
  constructor() {
    super('wrong_code');
  }
}
