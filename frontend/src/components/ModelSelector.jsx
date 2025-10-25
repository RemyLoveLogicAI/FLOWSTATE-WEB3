import { useEffect, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { fetchModels } from '../services/api';
import { Cpu } from 'lucide-react';

export function ModelSelector() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const selectedModel = useChatStore((state) => state.selectedModel);
  const setSelectedModel = useChatStore((state) => state.setSelectedModel);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const modelList = await fetchModels();
      setModels(modelList);
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <Cpu className="w-4 h-4 text-gray-400 animate-pulse" />
        <span className="text-sm text-gray-400">Loading models...</span>
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
        <Cpu className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <select
          value={selectedModel}
          onChange={handleModelChange}
          className="bg-transparent text-sm font-medium text-gray-700 dark:text-gray-300 outline-none cursor-pointer pr-2"
        >
          {models.length === 0 ? (
            <option value="">No models available</option>
          ) : (
            models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
}
