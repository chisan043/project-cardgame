export const CONCEPT_CROP_X = 218;

export const EVENT_UI_VIEWPORTS = [
  { name: 'concept', width: 1672, height: 941 },
  { name: 'game', width: 1280, height: 720 }
];

export const EVENT_UI_SCENARIOS = [
  { id: 'shop-buy', family: 'shop', openExpression: "state.gold = 236; state.currentShop = null; openShop();" },
  { id: 'shop-copy', family: 'shop', openExpression: "state.gold = 236; state.currentShop = null; openShop(); renderShopCopy();" },
  { id: 'shop-delete', family: 'shop', openExpression: "state.gold = 236; state.currentShop = null; openShop(); renderShopDelete();" },
  { id: 'encounter-home', family: 'encounter', openExpression: 'triggerEventNode();' },
  { id: 'encounter-treasure', family: 'encounter', openExpression: 'triggerEventNode(); selectEventRelic();' },
  { id: 'encounter-trial', family: 'encounter', openExpression: 'triggerEventNode(); selectEventUpgrade();' },
  { id: 'encounter-pack', family: 'encounter', openExpression: 'triggerEventNode(); selectEventTuneDeck();' },
  { id: 'campfire-home', family: 'campfire', openExpression: "showRestHome(); showOverlay('overlay-rest');" },
  { id: 'campfire-rest', family: 'campfire', openExpression: "showRestHome(); showOverlay('overlay-rest'); resolveRest();" },
  { id: 'campfire-upgrade', family: 'campfire', openExpression: "showRestHome(); showOverlay('overlay-rest'); renderRestUpgrade();" },
  { id: 'campfire-delete', family: 'campfire', openExpression: "showRestHome(); showOverlay('overlay-rest'); renderRestDelete();" }
];

export function getEventUiSnapshotPath(outputDir, viewportName, scenarioId) {
  const normalized = outputDir.replace(/\/+$/, '');
  return `${normalized}/${viewportName}/${scenarioId}.png`;
}
