import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './Login.module.css';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/admin/auth/login', {
                email: formData.email,
                password: formData.password
            });
            // Login success, cookies are automatically set by backend
            // Redirect to admin dashboard
            navigate('/admin/buses', { replace: true });
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Email hoặc mật khẩu không chính xác');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginBox}>
                <div className={styles.logo}>Hệ thống quản lý xe Bus</div>
                <div className={styles.subtitle}>Vui lòng đăng nhập để tiếp tục</div>
                
                {error && <div className={styles.errorMsg}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            className={styles.formControl}
                            placeholder="Nhập email của bạn"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label>Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            className={styles.formControl}
                            placeholder="Nhập mật khẩu"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className={styles.submitBtn} 
                        disabled={loading}
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
