import { atom } from 'recoil';

export const atoms = {
    loading: atom({ key: 'loading', default: false }),
    status: atom({ key: 'status', default: { show: false }}),
    session: atom({ key: 'session', default: undefined }),
    workflows: atom({ key: 'workflows', default: undefined }),
};
