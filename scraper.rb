require 'sinatra'
require 'json'
require 'nokogiri'
require 'open-uri'
require_relative 'player'

get '/' do
  File.read(File.join("public", 'index.html'))
end

#list all players
get '/players' do

  player = Player.new
  player.all.to_json

end

get '/players/:id' do

   player = Player.new
   player.find(params[:id]).to_json

end

get  '/player/:id' do
  #File.read(File.join("public", 'player.html'))
  @player = Player.new
  @player.find(params[:id]).to_json
  @id = params[:id]
  erb :player
end
