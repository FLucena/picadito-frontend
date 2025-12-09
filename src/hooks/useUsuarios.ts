// TODO: Implementar cuando el backend tenga endpoints de usuarios
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import type { UsuarioDTO } from '../types';
// Note: usuariosApi is not yet exported from '../services/api'

// export const useUsuarios = () => {
//   return useQuery({
//     queryKey: ['usuarios'],
//     queryFn: usuariosApi.getAll,
//   });
// };

// export const useUsuario = (id: number) => {
//   return useQuery({
//     queryKey: ['usuarios', id],
//     queryFn: () => usuariosApi.getById(id),
//     enabled: !!id,
//   });
// };

// export const useCreateUsuario = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (usuario: UsuarioDTO) => usuariosApi.create(usuario),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['usuarios'] });
//     },
//   });
// };

// export const useUpdateUsuario = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ id, usuario }: { id: number; usuario: UsuarioDTO }) =>
//       usuariosApi.update(id, usuario),
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: ['usuarios'] });
//       queryClient.invalidateQueries({ queryKey: ['usuarios', variables.id] });
//     },
//   });
// };

