import { call, put, takeLeading, select } from 'redux-saga/effects';
import webglController from '@/webgl/webglController';
import video from '@/video';
import { MAX_HISTORY } from '@/store/history/reducer';

import { APPLY_EFFECT, UNDO, REDO, CLEAR, error } from '../actionTypes';
import { Effect, Log, undoSuccess } from './actions';
import { getIndexAndLogs } from '../selectors';
import { updateStartEnd, setThumbnails, moveTo } from '../currentVideo/actions';

const revokeURL = (urls: string[]) => {
  urls.forEach(url => URL.revokeObjectURL(url));
};

function* checkApplyEffect(action) {
  const { index, logs } = yield select(getIndexAndLogs);
  const isFirstCrop = index === MAX_HISTORY && logs[0].effect === Effect.Crop;
  if (isFirstCrop) yield call(revokeURL, logs[0].thumbnails.current);
  else {
    const target = logs
      .filter((log, logIndex) => index < logIndex && log.Effect === Effect.Crop)
      .map(log => log.thumbnails.current);
    if (target.lenght > 0) yield call(revokeURL, target.flat());
  }
}

function* updateThumbnailsHistory(thumbnails: string[], { start, end }) {
  try {
    yield put(setThumbnails(thumbnails));
    yield put(updateStartEnd(start, end));
    yield put(moveTo(start));
    yield call(video.setCurrentTime, start);
  } catch (err) {
    console.log(err);
    yield put(error());
  }
}

const effectMapper = (effect: Effect) => {
  switch (effect) {
    case Effect.RotateClockwise:
      return {
        apply: webglController.rotateRight90Degree,
        rollback: webglController.rotateLeft90Degree,
      };
    case Effect.RotateCounterClockwise:
      return {
        apply: webglController.rotateLeft90Degree,
        rollback: webglController.rotateRight90Degree,
      };
    case Effect.FlipHorizontal:
      return {
        apply: webglController.reverseSideToSide,
        rollback: webglController.reverseUpsideDown,
      };
    case Effect.FlipVertical:
      return {
        apply: webglController.reverseSideToSide,
        rollback: webglController.reverseUpsideDown,
      };
    case Effect.Enlarge:
      return {
        apply: webglController.enlarge,
        rollback: webglController.reduce,
      };
    case Effect.Reduce:
      return {
        apply: webglController.reduce,
        rollback: webglController.enlarge,
      };
    default:
      return {};
  }
};

function* controlWebgl(action) {
  yield call(effectMapper(action.payload.effect).apply);
}

function* undoEffect(action) {
  const { index, logs } = yield select(getIndexAndLogs);
  if (index > 0) {
    const targetLog: Log = logs[index];
    if (targetLog.effect === Effect.Crop)
      yield call(
        updateThumbnailsHistory,
        targetLog.thumbnails.prev,
        targetLog.interval.prev
      );
    else {
      const { rollback, reverseEffect } = effectMapper[targetLog.effect];
      yield call(rollback);
      yield put(undoSuccess(index - 1, reverseEffect));
    }
  } else {
    console.log('더 이상 되돌릴 수 없습니다.');
    yield put(error());
  }
}

function* redoEffect(action) {
  const { index, logs } = yield select(getIndexAndLogs);
  if (index < logs.length) {
    const targetLog: Log = logs[index];
    if (targetLog.effect === Effect.Crop)
      yield call(
        updateThumbnailsHistory,
        targetLog.thumbnails.current,
        targetLog.interval.current
      );
    else {
      const { apply, reverseEffect } = effectMapper[targetLog.effect];
      yield call(apply);
      yield put(undoSuccess(index + 1, reverseEffect));
    }
  } else {
    console.log('더 이상 다시 실행할 수 없습니다.');
    yield put(error());
  }
}

function* clearEffect(action) {
  yield call(webglController.clear);
  yield call(updateThumbnailsHistory, video.getThumbnails(), {
    start: 0,
    end: video.get('duration'),
  });
}

export function* watchApplyEffect() {
  yield takeLeading(APPLY_EFFECT, controlWebgl);
  yield takeLeading(APPLY_EFFECT, checkApplyEffect);
}

export function* watchHistory() {
  yield takeLeading(UNDO, undoEffect);
  yield takeLeading(REDO, redoEffect);
  yield takeLeading(CLEAR, clearEffect);
}
