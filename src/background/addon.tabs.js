
'use strict';

export function setGroupId(tabId, groupId) {
	return browser.sessions.setTabValue(tabId, 'groupId', groupId);
}

export function getGroupId(tabId) {
	return browser.sessions.getTabValue(tabId, 'groupId');
}

export async function getGroupIdTimeout(tabId, timeout) {
	let groupId = undefined;
	const start = (new Date).getTime();
	while (groupId == undefined && (((new Date).getTime() - start) < timeout)) {
		groupId = await browser.sessions.getTabValue(tabId, 'groupId');
	}
	return groupId;
}

export async function create(createInfo) {

	let groupId = undefined;

	if (createInfo.hasOwnProperty('groupId')) {
		groupId = createInfo.groupId;
		delete createInfo.groupId;
	}

	let tab = await browser.tabs.create(createInfo);

	if (!tab) return;

	// wait for onCreated to add a groupId if none is set
	if (groupId == undefined) {
		groupId = await getGroupIdTimeout(tab.id, 100); // random timeout
	}
	
	setGroupId(tab.id, groupId);
	tab.groupId = groupId;
	
	return tab;
}

export async function query(queryInfo) {
	
	let groupId = undefined;

	if (queryInfo.hasOwnProperty('groupId')) {
		groupId = queryInfo.groupId;
		delete queryInfo.groupId;
	}
	
	let tabs = await browser.tabs.query({currentWindow: true});
	
	await Promise.all(tabs.map(async(tab) => {
		tab.groupId = await getGroupId(tab.id);
	}));
	
	if (groupId != undefined) {
		tabs = tabs.filter(tab => (tab.groupId == groupId));
	}
	
	return tabs;
}
