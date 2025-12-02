const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}

export interface ValidationError {
  message: string;
  rule: string;
  field: string;
}

export interface ValidationErrorResponse {
  errors: ValidationError[];
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public validationErrors?: ValidationError[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response, endpoint: string): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type');
  
  if (!contentType?.includes('application/json')) {
    throw new ApiError('Resposta inválida do servidor', response.status);
  }

  const data = await response.json();

  if (!response.ok) {
    // Token inválido ou expirado - fazer logout (exceto para endpoints de auth)
    if (response.status === 401 && !endpoint.startsWith('/auth/')) {
      localStorage.removeItem('fleet_token');
      localStorage.removeItem('fleet_user');
      window.location.href = '/login';
      throw new ApiError('Sessão expirada', 401);
    }
    
    // Erro de validação
    if (data.errors && Array.isArray(data.errors)) {
      throw new ApiError(
        'Erro de validação',
        response.status,
        data.errors
      );
    }
    
    // Erro genérico
    throw new ApiError(
      data.message || 'Erro na requisição',
      response.status
    );
  }

  return data;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Adicionar token de autenticação se disponível
  const token = localStorage.getItem('fleet_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    return await handleResponse<T>(response, endpoint);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Erro de conexão com o servidor', 0);
  }
}
