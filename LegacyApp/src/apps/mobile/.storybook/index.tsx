import AsyncStorage from '@react-native-async-storage/async-storage';
import { view } from './storybook.requires';

// Ensure view is initialized before getting the UI
if (!view) {
  throw new Error('Storybook view is not initialized. Make sure storybook.requires is loaded first.');
}

// Get StorybookUI synchronously at module load time
// This ensures the component is created with the correct React context
const StorybookUIRoot = view.getStorybookUI({
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
});

export default StorybookUIRoot;
