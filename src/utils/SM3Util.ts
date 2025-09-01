/**
 * SM3 加密工具类
 * 国密SM3密码杂凑算法实现
 */
export class SM3Util {
    /**
     * 对字符串进行SM3加密
     * @param str 待加密的字符串
     * @returns 加密后的十六进制字符串
     */
    static encrypt(str: string): string {
        const bytes = this.stringToBytes(str);
        const hashBytes = this.sm3(bytes);
        return this.bytesToHex(hashBytes);
    }

    /**
     * 字符串转字节数组
     * @param str 输入字符串
     * @returns 对应的UTF-8字节数组
     */
    private static stringToBytes(str: string): number[] {
        const bytes: number[] = [];
        for (let i = 0; i < str.length; i++) {
            const charCode = str.charCodeAt(i);
            if (charCode < 0x80) {
                bytes.push(charCode);
            } else if (charCode < 0x800) {
                bytes.push(0xc0 | (charCode >> 6));
                bytes.push(0x80 | (charCode & 0x3f));
            } else if (charCode < 0xd800 || charCode >= 0xe000) {
                bytes.push(0xe0 | (charCode >> 12));
                bytes.push(0x80 | ((charCode >> 6) & 0x3f));
                bytes.push(0x80 | (charCode & 0x3f));
            } else {
                // 处理UTF-16代理对
                i++;
                const charCode2 = str.charCodeAt(i);
                const codePoint = ((charCode & 0x3ff) << 10) | (charCode2 & 0x3ff);
                const encoded = codePoint + 0x10000;
                bytes.push(0xf0 | (encoded >> 18));
                bytes.push(0x80 | ((encoded >> 12) & 0x3f));
                bytes.push(0x80 | ((encoded >> 6) & 0x3f));
                bytes.push(0x80 | (encoded & 0x3f));
            }
        }
        return bytes;
    }

    /**
     * 字节数组转十六进制字符串
     * @param bytes 字节数组
     * @returns 十六进制字符串
     */
    private static bytesToHex(bytes: number[]): string {
        const hexChars: string[] = [];
        for (const b of bytes) {
            const hex = b.toString(16).padStart(2, '0');
            hexChars.push(hex);
        }
        return hexChars.join('').toUpperCase();
    }

    /**
     * SM3 哈希算法主函数
     * @param message 待哈希的字节数组
     * @returns 哈希结果字节数组(32字节)
     */
    private static sm3(message: number[]): number[] {
        // 初始化常量
        const IV: number[] = [
            0x7380166f, 0x4914b2b9, 0x172442d7, 0xda8a0600,
            0xa96f30bc, 0x163138aa, 0xe38dee4d, 0xb0fb0e4e
        ];

        // 消息填充
        const paddedMessage = this.padMessage(message);

        // 初始化寄存器
        let [A, B, C, D, E, F, G, H] = IV;

        // 迭代处理
        for (let i = 0; i < paddedMessage.length; i += 64) {
            const block = paddedMessage.slice(i, i + 64);
            const [AA, BB, CC, DD, EE, FF, GG, HH] = [A, B, C, D, E, F, G, H];

            // 消息扩展
            const W: number[] = new Array(68);
            const W1: number[] = new Array(64);

            // 填充W[0..15]
            for (let j = 0; j < 16; j++) {
                W[j] = (block[4 * j] << 24) | (block[4 * j + 1] << 16) |
                    (block[4 * j + 2] << 8) | block[4 * j + 3];
            }

            // 填充W[16..67]
            for (let j = 16; j < 68; j++) {
                W[j] = this.P1(W[j - 16] ^ W[j - 9] ^ this.rotl(W[j - 3], 15)) ^
                    this.rotl(W[j - 13], 7) ^ W[j - 6];
            }

            // 填充W1[0..63]
            for (let j = 0; j < 64; j++) {
                W1[j] = W[j] ^ W[j + 4];
            }

            // 64轮迭代
            for (let j = 0; j < 64; j++) {
                const SS1 = this.rotl(
                    (this.rotl(A, 12) + E + this.rotl(this.T(j), j)) & 0xFFFFFFFF,
                    7
                );
                const SS2 = SS1 ^ this.rotl(A, 12);
                const TT1 = (this.F(j, A, B, C) + D + SS2 + W1[j]) & 0xFFFFFFFF;
                const TT2 = (this.G(j, E, F, G) + H + SS1 + W[j]) & 0xFFFFFFFF;
                D = C;
                C = this.rotl(B, 9);
                B = A;
                A = TT1;
                H = G;
                G = this.rotl(F, 19);
                F = E;
                E = this.P0(TT2);
            }

            // 压缩结果
            A = (A ^ AA) & 0xFFFFFFFF;
            B = (B ^ BB) & 0xFFFFFFFF;
            C = (C ^ CC) & 0xFFFFFFFF;
            D = (D ^ DD) & 0xFFFFFFFF;
            E = (E ^ EE) & 0xFFFFFFFF;
            F = (F ^ FF) & 0xFFFFFFFF;
            G = (G ^ GG) & 0xFFFFFFFF;
            H = (H ^ HH) & 0xFFFFFFFF;
        }

        // 拼接结果
        return [
            ...this.wordToBytes(A), ...this.wordToBytes(B),
            ...this.wordToBytes(C), ...this.wordToBytes(D),
            ...this.wordToBytes(E), ...this.wordToBytes(F),
            ...this.wordToBytes(G), ...this.wordToBytes(H)
        ];
    }

    /**
     * 消息填充
     * @param message 原始消息字节数组
     * @returns 填充后的消息字节数组
     */
    private static padMessage(message: number[]): number[] {
        const len = message.length * 8;
        const padLength = (448 - (len % 512) + 512) % 512;

        // 复制原始消息
        const padded = [...message];

        // 添加1位'1'
        padded.push(0x80);

        // 添加k位'0'
        for (let i = 0; i < (padLength - 8) / 8; i++) {
            padded.push(0x00);
        }

        // 添加原始长度(64位)
        for (let i = 7; i >= 0; i--) {
            padded.push((len >>> (i * 8)) & 0xFF);
        }

        return padded;
    }

    /**
     * 循环左移
     * @param x 输入值
     * @param n 移位位数
     * @returns 移位后的值
     */
    private static rotl(x: number, n: number): number {
        return ((x << n) | (x >>> (32 - n))) & 0xFFFFFFFF;
    }

    /**
     * 布尔函数F
     * @param j 轮数
     * @param x 输入x
     * @param y 输入y
     * @param z 输入z
     * @returns 计算结果
     */
    private static F(j: number, x: number, y: number, z: number): number {
        if (j >= 0 && j <= 15) {
            return x ^ y ^ z;
        } else {
            return (x & y) | (x & z) | (y & z);
        }
    }

    /**
     * 布尔函数G
     * @param j 轮数
     * @param x 输入x
     * @param y 输入y
     * @param z 输入z
     * @returns 计算结果
     */
    private static G(j: number, x: number, y: number, z: number): number {
        if (j >= 0 && j <= 15) {
            return x ^ y ^ z;
        } else {
            return (x & y) | (~x & z);
        }
    }

    /**
     * 常量Tj
     * @param j 轮数
     * @returns 常量值
     */
    private static T(j: number): number {
        if (j >= 0 && j <= 15) {
            return 0x79cc4519;
        } else {
            return 0x7a879d8a;
        }
    }

    /**
     * 置换函数P0
     * @param x 输入值
     * @returns 计算结果
     */
    private static P0(x: number): number {
        return x ^ this.rotl(x, 9) ^ this.rotl(x, 17);
    }

    /**
     * 置换函数P1
     * @param x 输入值
     * @returns 计算结果
     */
    private static P1(x: number): number {
        return x ^ this.rotl(x, 15) ^ this.rotl(x, 23);
    }

    /**
     * 32位整数转4字节数组
     * @param word 32位整数
     * @returns 4字节数组
     */
    private static wordToBytes(word: number): number[] {
        return [
            (word >>> 24) & 0xFF,
            (word >>> 16) & 0xFF,
            (word >>> 8) & 0xFF,
            word & 0xFF
        ];
    }
}
