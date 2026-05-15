<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Models\UmkmStore;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     * All users are automatically sellers (UMKM) with an auto-created store.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => $input['password'],
            'role' => 'umkm',
        ]);

        // Auto-create UMKM store for the new seller
        UmkmStore::create([
            'user_id' => $user->id,
            'name' => $input['name'],
            'slug' => Str::slug($input['name']) . '-' . Str::random(5),
            'description' => '',
            'address_pickup' => '',
        ]);

        return $user;
    }
}
