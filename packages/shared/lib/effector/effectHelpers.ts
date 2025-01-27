import { Effect, EffectState } from 'effector';

export const getEffectStatus = <Params, Done, Fail>(
  effect: Effect<Params, Done, Fail>,
): EffectState<Done> => ({
  loading: effect.pending.getState(),
  error: effect.failData.getState() || null,
  data: effect.doneData.getState() || null,
});

export const withErrorHandler = <T>(effect: Effect<any, T>) =>
  effect.failData.watch((error) => {
    console.error('Effect error:', error);
    //Здесь можно добавить обработку ошибок
  });
