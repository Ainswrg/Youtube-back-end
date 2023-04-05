import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectModel } from 'nestjs-typegoose'
import { UserModel } from 'src/user/user.model'
import { compare, genSalt, hash } from 'bcryptjs'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { AuthDto } from './auth.dto'

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>,
    private readonly jwtService: JwtService
  ) {}

  async login(dto: AuthDto) {
    const user = await this.validateUser(dto)

    return {
      user: this.returnUserFields(user),
      accessToken: await this.issuesAccessToken(String(user._id))
    }
  }

  async register(dto: AuthDto) {
    const oldUser = await this.UserModel.findOne({ email: dto.email })
    if (oldUser) {
      throw new BadRequestException('User with this email already exists')
    }

    const salt = await genSalt(10)

    const newUser = new this.UserModel({
      email: dto.email,
      passport: await hash(dto.password, salt)
    })

    const user = await newUser.save()

    return {
      user: this.returnUserFields(user),
      accessToken: await this.issuesAccessToken(String(user._id))
    }
  }

  async validateUser(dto: AuthDto): Promise<UserModel> {
    const user = await this.UserModel.findOne({ email: dto.email })
    if (!user) throw new UnauthorizedException('User not found')

    const isValidPassport = compare(dto.password, user.password)
    if (!isValidPassport) throw new UnauthorizedException('Invalid password')

    return user
  }

  async issuesAccessToken(userId: string) {
    const data = { _id: userId }
    return await this.jwtService.signAsync(data, {
      expiresIn: '31d'
    })
  }

  returnUserFields(user: UserModel) {
    return {
      _id: user._id,
      email: user.email
    }
  }
}
