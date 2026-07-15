export { default as EmbedWidgetWorkspace } from './components/EmbedWidgetWorkspace.vue';
export { useEmbedConfiguratorStore } from './store/useEmbedConfiguratorStore';
export { EmbedCommunicationBridge } from './engine/EmbedCommunicationBridge';
export { SecureOriginChecker } from './engine/SecureOriginChecker';
export { AutoHeightResizer } from './engine/AutoHeightResizer';
export type {
  EmbedMessage,
  EmbedTheme,
  EmbedConfig,
  EmbedMessageAction,
  EmbedMessageSource,
  EmbedMessagePayload,
} from './types/embed-widget.types';
