import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

export const confirmDelete = async (title = 'Apakah Anda yakin?', text = 'Data yang dihapus tidak dapat dikembalikan!') => {
  const result = await MySwal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass: {
      popup: 'dark:bg-slate-800 dark:text-white',
    },
  })

  return result.isConfirmed
}

export const confirmAction = async (title, text, icon = 'question') => {
  const result = await MySwal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya',
    cancelButtonText: 'Batal',
    reverseButtons: true,
    customClass: {
      popup: 'dark:bg-slate-800 dark:text-white',
    },
  })

  return result.isConfirmed
}

export const showSuccess = (title, text = '') => {
  return MySwal.fire({
    title,
    text,
    icon: 'success',
    timer: 2000,
    showConfirmButton: false,
    customClass: {
      popup: 'dark:bg-slate-800 dark:text-white',
    },
  })
}

export const showError = (title, text = '') => {
  return MySwal.fire({
    title,
    text,
    icon: 'error',
    customClass: {
      popup: 'dark:bg-slate-800 dark:text-white',
    },
  })
}

export const showWarning = (title, text = '') => {
  return MySwal.fire({
    title,
    text,
    icon: 'warning',
    customClass: {
      popup: 'dark:bg-slate-800 dark:text-white',
    },
  })
}