import { Model, ModelsResponse } from '../../src/assistants/Assistant.js';
import Assistant from '../../src/assistants/Assistant.js';

describe('Assistant Class', () => {
  const baseUrl = 'https://api.openai.com/v1';
  const model = 'gpt-3.5-turbo';
  const bearerToken = 'testBearerToken';

  beforeAll(() => {
    process.env.OPENAI_API_URL = baseUrl;
    process.env.OPENAI_API_MODEL = model;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('testConnection', () => {
    it('should return JSON data when the request is successful', async () => {
      const mockData: ModelsResponse = {
        object: 'list',
        data: [
          {
            id: 'model1',
            object: 'model',
            created: 1620000000,
            owned_by: 'organization',
            permission: [],
            root: 'model1',
            parent: null,
          },
          {
            id: 'model2',
            object: 'model',
            created: 1620000001,
            owned_by: 'organization',
            permission: [],
            root: 'model2',
            parent: null,
          },
        ],
      };
      const assistant = new Assistant(bearerToken);

      global.fetch = jest.fn().mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockData),
      } as unknown as Response);

      const response = await assistant.testConnection();

      expect(response).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      });
    });
  });

  describe('testModelAvailability', () => {
    const models: Model[] = [
      {
        id: 'model1',
        object: 'model',
        created: 1620000000,
        owned_by: 'organization',
        permission: [],
        root: 'model1',
        parent: null,
      },
      {
        id: 'model2',
        object: 'model',
        created: 1620000001,
        owned_by: 'organization',
        permission: [],
        root: 'model2',
        parent: null,
      },
      {
        id: 'model3',
        object: 'model',
        created: 1620000002,
        owned_by: 'organization',
        permission: [],
        root: 'model3',
        parent: null,
      },
    ];

    it('should return the filtered model when it exists', () => {
      process.env.OPENAI_API_MODEL = 'MODEL2';
      const assistant = new Assistant(bearerToken);
      
      const result = assistant.testModelAvailability(models);
    
      const expectedModel = models.find(
        (model) => model.id.toLowerCase() === 'model2'.toLowerCase()
      );
    
      expect(result).toEqual(expectedModel ? [expectedModel] : models);
      process.env.OPENAI_API_MODEL = model;
    });

    it('should return all models when the specified model does not exist', () => {
      const assistant = new Assistant(bearerToken);
      const result = assistant.testModelAvailability(models);

      expect(result).toEqual(models);
    });
  });
});