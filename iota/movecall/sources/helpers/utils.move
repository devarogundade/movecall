// SPDX-License-Identifier: MIT
module movecall::utils {
    use std::string;
    use std::ascii::into_bytes;
    use std::type_name::{get, into_string};

    public fun get_coin_type<CoinType>(): string::String {
        string::utf8(into_bytes(into_string(get<CoinType>())))
    }
}