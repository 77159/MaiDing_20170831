/**
 * @authors  hxb (huangxuebing@fengmap.com)
 * @date     2017/9/6
 * @describe 人员管理 selectors
 */
'use strict';
import {createSelector} from 'reselect';

const selectPeople = (state) => state.get('people');

const peopleDataSourceSelector = () => createSelector(
    selectPeople,
    (peopleState) => peopleState.get('peopleDataSource')
);

const tableDataLoadingSelector = () => createSelector(
    selectPeople,
    (peopleState) => peopleState.get('tableDataLoading')
);

/**
 *
 */
const peopleListSelector = () => createSelector(
    selectPeople,
    (peopleState) => {
        const peopleDataSource = peopleState.get('peopleDataSource') ? peopleState.get('peopleDataSource') : [];
        return peopleDataSource.filter((item) => {
            return item.deviceCode !== null && item.deviceCode !== '';
        });
    }
);

export {
    selectPeople,
    peopleDataSourceSelector,
    tableDataLoadingSelector,
    peopleListSelector
};
