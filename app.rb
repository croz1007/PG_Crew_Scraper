# frozen_string_literal: true

require 'sinatra/base'
require 'json'
require_relative 'player'

class CrewScraperApp < Sinatra::Base
  set :public_folder, File.expand_path('public', __dir__)
  set :views, File.expand_path('views', __dir__)

  get '/' do
    haml :index
  end

  get '/players' do
    content_type :json
    PlayerRepository.new.all.to_json
  rescue StandardError => e
    status 502
    { error: 'Failed to fetch roster data', details: e.message }.to_json
  end

  get '/players/:id' do
    content_type :json

    player = PlayerRepository.new.find(params[:id])
    halt 404, { error: 'Player not found' }.to_json if player.nil?

    player.to_json
  rescue ArgumentError
    status 400
    { error: 'Invalid player id' }.to_json
  rescue StandardError => e
    status 502
    { error: 'Failed to fetch roster data', details: e.message }.to_json
  end

  get '/player/:id' do
    @id = Integer(params[:id])
    haml :player
  rescue ArgumentError
    halt 400, 'Invalid player id'
  end
end
