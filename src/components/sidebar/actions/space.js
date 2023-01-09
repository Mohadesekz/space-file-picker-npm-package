import Constants from '../constants';
import { SpaceSelector } from '../selectors';

export const fetchSpaceRequest = {
  type: Constants.FETCH_SPACE_REQUEST.toString(),
};

export const fetchPlanRequest = {
  type: Constants.FETCH_PLAN_REQUEST.toString(),
};

export const fetchSpaceSuccess = response => ({
  type: Constants.FETCH_SPACE_SUCCESS,
  response: SpaceSelector(response),
});

export const fetchPlanSuccess = plans => ({
  type: Constants.FETCH_PLAN_SUCCESS,
  plans,
});

export const fetchSpaceFailure = () => ({
  type: Constants.FETCH_SPACE_FAILURE,
});

export const fetchPlanFailure = error => ({
  error,
  type: Constants.FETCH_PLAN_FAILURE,
});

export const upgradePlanCheckPayment = params => ({
  params,
  type: Constants.UPGRADE_PLAN_CHECK_PAYMENT.toString(),
});

export const checkPlan = (hashPlan, onEnd) => ({
  hashPlan,
  onEnd,
  type: Constants.PLAN_CHECK.toString(),
});

export const getAndroidLink = onEnd => ({
  onEnd,
  type: Constants.GET_ANDROID_LINK.toString(),
});
