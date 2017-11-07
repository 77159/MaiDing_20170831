/**
 * @authors  hxb (huangxuebing@fengmap.com)
 * @date     2017/9/6
 * @describe 添加人员 selectors
 */
'use strict';
import {createSelector} from 'reselect';

const selectorPeopleFormModal = (state) => state.get('peopleFormModal');

const peopleEntitySelector = () => createSelector(
    selectorPeopleFormModal,
    (peopleModalState) => peopleModalState.get('peopleEntity')
);

const modalVisibleSelector = () => createSelector(
    selectorPeopleFormModal,
    (peopleModalState) => peopleModalState.get('modalVisible')
);

const operationSelector = () => createSelector(
    selectorPeopleFormModal,
    (peopleModalState) => peopleModalState.get('operation')
);


const operationRunningSelector = () => createSelector(
    selectorPeopleFormModal,
    (peopleModalState) => peopleModalState.get('operationRunning')
);

const imgURLSelector = () => createSelector(
    selectorPeopleFormModal,
    (peopleModalState) => peopleModalState.get('imgURL')
);

export {
    selectorPeopleFormModal,
    peopleEntitySelector,
    modalVisibleSelector,
    operationSelector,
    operationRunningSelector,
    imgURLSelector
};
