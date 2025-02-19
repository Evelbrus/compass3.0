import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import LoginSection from '@pages/login/login-section/ui/LoginSection';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
const LoginPage = () => {
    return (_jsxs("div", { className: "max-w-[1920px] min-h-screen flex mx-auto", children: [_jsx("div", { className: "flex-1", style: {
                    backgroundImage: "url('/compass.png')",
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'left center',
                } }), _jsx("div", { className: "flex justify-center items-center w-[40%] bg- p-5", children: _jsx(AnimatedComponent, { duration: 500, className: "w-full", children: _jsx(LoginSection, {}) }) })] }));
};
export default LoginPage;
